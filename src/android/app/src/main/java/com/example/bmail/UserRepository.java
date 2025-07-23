package com.example.bmail;

import android.util.Log;

import androidx.annotation.NonNull;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.Call;
import retrofit2.Response;

import java.io.IOException;

public class UserRepository {
    private final AuthApi authApi;

    public UserRepository() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("http://localhost:8080/api/")
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        authApi = retrofit.create(AuthApi.class);
    }

    public void login(String username, String password) {
        LoginRequest request = new LoginRequest(username, password);
        Call<LoginResponse> call = authApi.login(request);
        call.enqueue(new retrofit2.Callback<>() {
            @Override
            public void onResponse(@NonNull Call<LoginResponse> call, @NonNull Response<LoginResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Log.i("UserRepository", "Login successful: " + response.body().success);
                } else {
                    Log.e("UserRepository", "Login failed: " + response.message());
                }
            }

            @Override
            public void onFailure(@NonNull Call<LoginResponse> call, @NonNull Throwable t) {
                Log.e("UserRepository", "Login request failed", t);
            }
        });
    }
}
