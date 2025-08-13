package com.example.bmail.Api;

import android.content.ContentResolver;
import android.content.Context;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import android.content.SharedPreferences;
import android.net.Uri;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.example.bmail.Entities.LoginRequest;
import com.example.bmail.Entities.LoginResponse;
import com.example.bmail.R;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import retrofit2.Call;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class SignupApi {

    public interface callback {
        void onSuccess(String msg);

        void onFailure(String errorMessage);
    }

    private final WebServiceApi webServiceApi;
    private final Context context;
    private final String PREFS_NAME = "user_prefs";
    private final String TAG = "SignupApi";

    public SignupApi(@NonNull Context context) {
        this.context = context.getApplicationContext();
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(context.getString(R.string.api))
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        webServiceApi = retrofit.create(WebServiceApi.class);
    }

    public void login(String username, String password, callback loginCallback) {
        LoginRequest request = new LoginRequest(username, password);
        Call<LoginResponse> call = webServiceApi.login(request);
        call.enqueue(new retrofit2.Callback<>() {
            @Override
            public void onResponse(@NonNull Call<LoginResponse> call, @NonNull Response<LoginResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    String token = response.body().getToken();
                    String userId = response.body().getId();
                    Log.i(TAG, "Token: " + token);
                    Log.i(TAG, "User ID: " + userId);
                    saveToken(token);
                    saveUserId(userId);
                    loginCallback.onSuccess("Login successful");
                } else {
                    String errorMsg = "Login failed: " + response.message();
                    Log.e(TAG, errorMsg);
                    loginCallback.onFailure(errorMsg);
                }
            }

            @Override
            public void onFailure(@NonNull Call<LoginResponse> call, @NonNull Throwable t) {
                String errorMsg = "Network error: " + t.getMessage();
                Log.e(TAG, "Login request failed", t);
                loginCallback.onFailure(errorMsg);
            }
        });
    }

    public void signup(RequestBody firstName, RequestBody lastName,
                        RequestBody username, RequestBody password, String imageUri,
                       callback signupCallback) {

        MultipartBody.Part image = createImagePart(imageUri);
        Call<Void> call = webServiceApi.signup(firstName,
                lastName, username, password, image);
        call.enqueue(new retrofit2.Callback<>() {
            @Override
            public void onResponse(@NonNull Call<Void> call, @NonNull Response<Void> response) {
                if (response.isSuccessful()) {
                    // Assuming signup also returns a token
                    signupCallback.onSuccess("Signup successful");
                } else {
                    String errorMsg = "Signup failed: " + response.message();
                    Log.e(TAG, errorMsg);
                    signupCallback.onFailure(errorMsg);
                }
            }

            @Override
            public void onFailure(@NonNull Call<Void> call, @NonNull Throwable t) {
                String errorMsg = "Network error: " + t.getMessage();
                Log.e(TAG, errorMsg);
                signupCallback.onFailure(errorMsg);
            }
        });
    }

    private MultipartBody.Part createImagePart(String imageUri) {

        // Handle the image file
        MultipartBody.Part imagePart;
        if (imageUri != null && !imageUri.isEmpty()) {
            try {
                Uri uri = Uri.parse(imageUri);
                byte[] imageBytes = getBytesFromUri(uri);
                if (imageBytes != null) {
                    RequestBody imageBody = RequestBody.create(imageBytes, MediaType.parse("image/*"));
                    imagePart = MultipartBody.Part.createFormData("image", "profile_image.jpg", imageBody);
                    return imagePart;
                }
            } catch (IOException e) {
                Log.e(TAG, "Error reading image file", e);
            }
        }
        return null;
    }

    @Nullable
    private byte[] getBytesFromUri(Uri uri) throws IOException {
        ContentResolver contentResolver = context.getContentResolver();
        try (InputStream inputStream = contentResolver.openInputStream(uri)) {
            if (inputStream == null) return null;

            ByteArrayOutputStream byteBuffer = new ByteArrayOutputStream();
            int bufferSize = 1024;
            byte[] buffer = new byte[bufferSize];
            int len;
            while ((len = inputStream.read(buffer)) != -1) {
                byteBuffer.write(buffer, 0, len);
            }
            return byteBuffer.toByteArray();
        }
    }
    private void saveToken(String token) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("auth_token", token);
        editor.apply();
    }

    private void saveUserId(String userId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("user_id", userId);
        editor.apply();
    }
}
