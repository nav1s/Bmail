package com.example.bmail.Api;

import com.example.bmail.Entities.AttachLabelRequest;
import com.example.bmail.Entities.ClientMail;
import com.example.bmail.Entities.CreateLabelRequest;
import com.example.bmail.Entities.LoginRequest;
import com.example.bmail.Entities.LoginResponse;
import com.example.bmail.Entities.ServerMail;
import com.example.bmail.Entities.Label;
import com.example.bmail.Entities.SignupRequest;
import com.example.bmail.Entities.User;

import java.util.List;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.PATCH;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Url;

public interface WebServiceApi {
    @GET
    Call<ResponseBody> downloadImage(@Header("Authorization") String token,
                                       @Url String url);
    @POST("/api/users")
    Call<Void> signup(@Body SignupRequest request);
    @GET("/api/users/{id}")
    Call<User> getUserDetails(@Header("Authorization") String token, @Path("id") String userId);

    @POST("/api/tokens")
    Call<LoginResponse> login(@Body LoginRequest request);

    @GET("/api/mails/byLabel/{label}")

    Call<List<ServerMail>> getMails(@Header("Authorization") String token, @Path ("label") String label);

    @POST("/api/mails")
    Call<Void> sendMail(@Header("Authorization") String token, @Body ClientMail mail);

    @PATCH("/api/mails/{id}")
    Call<Void> updateDraft(@Header("Authorization") String token, @Body ServerMail mail,
                           @Path("id") String id);

    @GET("/api/mails/search/{query}")
    Call<List<ServerMail>> searchMails(@Header("Authorization") String token,
                                       @Path ("query") String query);

    @GET("/api/labels")
    Call <List<Label>> getLabels(@Header("Authorization") String token);
    @POST("/api/labels")
    Call<Void> createLabel(@Header("Authorization") String token, @Body CreateLabelRequest request);

    @POST("/api/mails/{id}/labels")
    Call<Void> addLabelToMail(@Header("Authorization") String token, @Path("id") String mailId,
                              @Body AttachLabelRequest request);
    @DELETE("/api/mails/{id}/labels/{labelId}")
    Call<Void> removeLabelFromMail(@Header("Authorization") String token, @Path("id") String mailId,
                                   @Path("labelId") String labelId);
    @DELETE("/api/mails/{id}")
    Call<Void> deleteMail(@Header("Authorization") String token, @Path("id") String mailId);
}
