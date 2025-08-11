package com.example.bmail.Api;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.annotation.NonNull;

import com.example.bmail.Entities.LoginRequest;
import com.example.bmail.Entities.LoginResponse;
import com.example.bmail.Entities.SignupRequest;
import com.example.bmail.Entities.User;
import com.example.bmail.R;

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
                    String userId = response.body().getUserId();
                    Log.i("UserRepository", "Token: " + token);
                    saveToken(token);
                    saveUserId(userId);
                    loginCallback.onSuccess("Login successful");
                } else {
                    String errorMsg = "Login failed: " + response.message();
                    Log.e("UserRepository", errorMsg);
                    loginCallback.onFailure(errorMsg);
                }
            }

            @Override
            public void onFailure(@NonNull Call<LoginResponse> call, @NonNull Throwable t) {
                String errorMsg = "Network error: " + t.getMessage();
                Log.e("UserRepository", "Login request failed", t);
                loginCallback.onFailure(errorMsg);
            }
        });
    }

    public void signup(String firstName, String lastName, String username,
                       String password, callback signupCallback) {
        SignupRequest request = new SignupRequest(firstName, lastName, username, password);

        Call<Void> call = webServiceApi.signup(request);
        call.enqueue(new retrofit2.Callback<>() {
            @Override
            public void onResponse(@NonNull Call<Void> call, @NonNull Response<Void> response) {
                if (response.isSuccessful()) {
                    // Assuming signup also returns a token
                    signupCallback.onSuccess("Signup successful");
                } else {
                    String errorMsg = "Signup failed: " + response.message();
                    Log.e("UserRepository", errorMsg);
                    signupCallback.onFailure(errorMsg);
                }
            }

            @Override
            public void onFailure(@NonNull Call<Void> call, @NonNull Throwable t) {
                String errorMsg = "Network error: " + t.getMessage();
                Log.e("UserRepository", errorMsg);
                signupCallback.onFailure(errorMsg);
            }
        });
    }

    private void saveToken(String token) {
        SharedPreferences prefs = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("auth_token", token);
        editor.apply();
    }

    private void saveUserId(String userId) {
        SharedPreferences prefs = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("user_id", userId);
        editor.apply();
    }
}
