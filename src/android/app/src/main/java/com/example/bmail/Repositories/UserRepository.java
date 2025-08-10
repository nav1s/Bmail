package com.example.bmail.Repositories;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.annotation.NonNull;

import com.example.bmail.Api.WebServiceApi;
import com.example.bmail.Entities.LoginRequest;
import com.example.bmail.Entities.LoginResponse;
import com.example.bmail.R;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.Call;
import retrofit2.Response;

public class UserRepository {
    private final WebServiceApi webServiceApi;
    private final Context context;

    // Callback interface for login operations
    public interface LoginCallback {
        void onLoginSuccess(String token);
        void onLoginFailure(String errorMessage);
    }

    // todo create user api
    public UserRepository(@NonNull Context context) {
        this.context = context.getApplicationContext();
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(context.getString(R.string.api))
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        webServiceApi = retrofit.create(WebServiceApi.class);
    }

    public void login(String username, String password, LoginCallback callback) {
        LoginRequest request = new LoginRequest(username, password);
        Call<LoginResponse> call = webServiceApi.login(request);
        call.enqueue(new retrofit2.Callback<>() {
            @Override
            public void onResponse(@NonNull Call<LoginResponse> call, @NonNull Response<LoginResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    String token = response.body().getToken();
                    Log.i("UserRepository", "Token: " + token);
                    saveToken(token);
                    callback.onLoginSuccess(token);
                } else {
                    String errorMsg = "Login failed: " + response.message();
                    Log.e("UserRepository", errorMsg);
                    callback.onLoginFailure(errorMsg);
                }
            }

            @Override
            public void onFailure(@NonNull Call<LoginResponse> call, @NonNull Throwable t) {
                String errorMsg = "Network error: " + t.getMessage();
                Log.e("UserRepository", "Login request failed", t);
                callback.onLoginFailure(errorMsg);
            }
        });
    }

    private void saveToken(String token) {
        SharedPreferences prefs = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("auth_token", token);
        editor.apply();

    }
}
