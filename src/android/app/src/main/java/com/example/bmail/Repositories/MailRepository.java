package com.example.bmail.Repositories;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.bmail.Api.WebServiceApi;
import com.example.bmail.Entities.Mail;

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
            mails.add(new Mail(0, "Welcome to BMail", "This is your first email!",
                    "System", List.of("Alice", "Bob"), false));
            mails.add(new Mail(1, "Meeting Reminder",
                    "Don't forget our meeting tomorrow.",
                    "Alice", List.of("Bob"), false));
            mails.add(new Mail(2, "Project Update",
                    "The project is on track for completion next week.",
                    "Bob", List.of("Alice"), false));
            mails.add(new Mail(3, "Newsletter",
                    "Check out our latest updates and features.",
                    "Newsletter", List.of("Alice", "Bob"), false));
            setValue(mails);
        }
    }

    private final MailListData mailListData = new MailListData();

    private final WebServiceApi mailsApi;
    private final Context context;

    public MailRepository(Context context) {
        this.context = context;
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("http://localhost:8080/api/")
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        mailsApi = retrofit.create(WebServiceApi.class);
    }

    public LiveData<List<Mail>> getMails() {
        SharedPreferences prefs = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE);
        String token = prefs.getString("auth_token", null);

        Call<List<Mail>> call = mailsApi.getMails(token);
        call.enqueue(new retrofit2.Callback<>() {
            @Override
            public void onResponse(@NonNull Call<List<Mail>> call, @NonNull retrofit2.Response<List<Mail>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Log.d("MailRepository", "Fetched mails successfully");
                    mailListData.postValue(response.body());
                } else {
                    Log.e("MailRepository", "Failed to fetch mails: " + response.message());
                    mailListData.postValue(null);
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Mail>> call, @NonNull Throwable t) {
                Log.e("MailRepository", "Network error: " + t.getMessage());
                mailListData.postValue(null);
            }
        });
        return mailListData;
    }

    public void sendMail(Mail mail) {
    }

    public void deleteMail(Mail mail) {
    }

    public void reloadMails() {

    }
}
