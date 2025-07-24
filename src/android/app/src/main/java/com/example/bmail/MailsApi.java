package com.example.bmail;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;

public interface MailsApi {
     @GET("mails")
     Call<List<Email>> getMails(@Header("Authorization") String token);

}
