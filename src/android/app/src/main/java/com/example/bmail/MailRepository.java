package com.example.bmail;

import android.content.Context;
import android.content.SharedPreferences;

import java.util.List;

import retrofit2.Call;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class MailRepository {
    private final MailsApi mailsApi;
    private final Context context;

    public MailRepository(Context context) {
        this.context = context.getApplicationContext();

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("http://localhost:8080/api/")
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        mailsApi = retrofit.create(MailsApi.class);
    }

    // Dummy method to simulate loading emails
    public void getEmails() {
        SharedPreferences prefs = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE);
        String token = prefs.getString("auth_token", null);

        Call<List<MailResponse>> call = mailsApi.getMails(token);
    }
}

