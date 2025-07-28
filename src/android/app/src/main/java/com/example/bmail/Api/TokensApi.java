package com.example.bmail.Api;

import com.example.bmail.Entities.LoginRequest;
import com.example.bmail.Entities.LoginResponse;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface TokensApi {
    @POST("tokens")
    Call<LoginResponse> login(@Body LoginRequest request);
}
