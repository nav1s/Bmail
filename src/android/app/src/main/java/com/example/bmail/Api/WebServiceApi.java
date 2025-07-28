package com.example.bmail.Api;

import com.example.bmail.Entities.LoginRequest;
import com.example.bmail.Entities.LoginResponse;
import com.example.bmail.Entities.Mail;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface WebServiceApi {
    @POST("tokens")
    Call<LoginResponse> login(@Body LoginRequest request);

    @GET("mails/byLabel/{label}")
    Call<List<Mail>> getMails(@Header("Authorization") String token,
    @Path ("label") String label);
}
