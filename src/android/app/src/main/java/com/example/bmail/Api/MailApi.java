package com.example.bmail.Api;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.MutableLiveData;

import com.example.bmail.Entities.Mail;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class MailApi {

    // todo add dao
    private final MutableLiveData<List<Mail>> mailListData;
    WebServiceApi webServiceApi;
    private final Context context;

    public MailApi(MutableLiveData<List<Mail>> mailListData, Context context) {
        this.mailListData = mailListData;
        this.context = context.getApplicationContext();
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("http://localhost:8080/api/")
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        webServiceApi = retrofit.create(WebServiceApi.class);
    }

    public void reload(){
        SharedPreferences prefs = context.getSharedPreferences("user_prefs",
                Context.MODE_PRIVATE);
        String token = prefs.getString("auth_token", null);
        Log.i("MailApi", "Token: " + token);

        Call<List<Mail>> call = webServiceApi.getMails("Bearer " + token);
        call.enqueue(
                new Callback<List<Mail>>() {

                    @Override
                    public void onResponse(@NonNull Call<List<Mail>> call,
                                           @NonNull Response<List<Mail>> response) {
                        new Thread(() -> {
                            if (response.isSuccessful() && response.body() != null) {
                                Log.i("MailApi", "Fetched mails successfully");
                                List<Mail> mails = response.body();
                                mailListData.postValue(mails);
                            } else {
                                Log.e("MailApi", "Failed to fetch mails: " + response.message());
                                mailListData.postValue(null);
                            }
                        }).start();

                    }

                    @Override
                    public void onFailure(@NonNull Call<List<Mail>> call,
                                          @NonNull Throwable t) {
                        Log.e("MailApi", "Network error: " + t.getMessage());
                        mailListData.setValue(null);
                    }
                }
        );

    }
}
