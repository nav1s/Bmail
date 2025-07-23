package com.example.bmail;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface AuthApi {
    @POST("tokens")
    Call<LoginResponse> login(@Body LoginRequest request);
}
