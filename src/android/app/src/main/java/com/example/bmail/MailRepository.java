package com.example.bmail;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import java.util.LinkedList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class MailRepository {
    static class MailListData extends MutableLiveData<List<Mail>> {
        public MailListData() {
            super();
            List<Mail> mails = new LinkedList<>();
            setValue(mails);
        }
    }
    private final MailListData mailListData = new MailListData();

//    private final MailsApi mailsApi;
//    private final Context context;

    public MailRepository(@NonNull Context context) {
//        this.context = context.getApplicationContext();
//
//        Retrofit retrofit = new Retrofit.Builder()
//                .baseUrl("http://localhost:8080/api/")
//                .addConverterFactory(GsonConverterFactory.create())
//                .build();
//        mailsApi = retrofit.create(MailsApi.class);
    }

    public LiveData<List<Mail>> getMails() {
        return mailListData;
//        SharedPreferences prefs = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE);
//        String token = prefs.getString("auth_token", null);
//
//        Call<List<MailResponse>> call = mailsApi.getMails(token);
    }

    public void sendMail(Mail mail) {
    }
    public void deleteMail(Mail mail) {
    }
    public void reloadMails(){

    }
}

