package com.example.bmail.Api;

import com.example.bmail.Entities.MailResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;

public interface MailsApi {
     @GET("mails")
     Call<List<MailResponse>> getMails(@Header("Authorization") String token);

}
