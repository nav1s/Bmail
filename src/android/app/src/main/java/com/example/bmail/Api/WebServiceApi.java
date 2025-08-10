package com.example.bmail.Api;

import com.example.bmail.Entities.LoginRequest;
import com.example.bmail.Entities.LoginResponse;
import com.example.bmail.Entities.Mail;
import com.example.bmail.Entities.Label;
import com.example.bmail.Entities.SignupRequest;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.PATCH;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface WebServiceApi {
    @POST("users")
    Call<Void> signup(@Body SignupRequest request);

    @POST("tokens")
    Call<LoginResponse> login(@Body LoginRequest request);

    @GET("mails/byLabel/{label}")

    Call<List<Mail>> getMails(@Header("Authorization") String token, @Path ("label") String label);

    @POST("mails")
    Call<Void> sendMail(@Header("Authorization") String token, @Body Mail mail);

    @PATCH("mails/{id}")
    Call<Void> updateDraft(@Header("Authorization") String token, @Body Mail mail, @Path("id") int id);

    @GET("mails/search/{query}")
    Call<List<Mail>> searchMails(@Header("Authorization") String token,
                                 @Path ("query") String query);

    @GET("labels")
    Call <List<Label>> getLabels(@Header("Authorization") String token);
}
