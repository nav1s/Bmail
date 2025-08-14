package com.example.bmail.Api;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.annotation.NonNull;

import com.example.bmail.Entities.LoginRequest;
import com.example.bmail.Entities.LoginResponse;
import com.example.bmail.R;
import com.example.bmail.Utils.ImageUtils;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
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

    /**
     * @brief Logs in a user with the provided username and password.
     * @param username the username of the user
     * @param password the password of the user
     * @param loginCallback the callback to handle the login result
     */
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

    /**
     * @brief Signs up a new user with the provided details.
     * @param firstName the first name of the user
     * @param lastName the last name of the user
     * @param username the username for the new account
     * @param password the password for the new account
     * @param imageUri the URI of the profile image to upload
     * @param signupCallback the callback to handle the signup result
     */
    public void signup(RequestBody firstName, RequestBody lastName,
                        RequestBody username, RequestBody password, String imageUri,
                       callback signupCallback) {

        MultipartBody.Part image = ImageUtils.createImagePart(context, imageUri, "image");
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

    /**
     * @brief Saves the authentication token in SharedPreferences.
     * @param token The authentication token to save.
     */
    private void saveToken(String token) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("auth_token", token);
        editor.apply();
    }

    /**
     * @brief Saves the user ID in SharedPreferences.
     * @param userId The user ID to save.
     */
    private void saveUserId(String userId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("user_id", userId);
        editor.apply();
    }
}
