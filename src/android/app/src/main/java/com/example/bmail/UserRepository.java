package com.example.bmail;

import android.util.Log;

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

    public boolean login(String username, String password) {
        LoginRequest request = new LoginRequest(username, password);
        Call<LoginResponse> call = authApi.login(request);
        try {
            Response<LoginResponse> response = call.execute();
            return response.isSuccessful() && response.body() != null && response.body().success;
        } catch (IOException e) {
            Log.e("UserRepository", "Login failed", e);
            return false;
        }
    }
}
