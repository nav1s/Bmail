package com.example.bmail.Api;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.MutableLiveData;

import com.example.bmail.Entities.Mail;
import com.example.bmail.R;
import com.example.bmail.db.MailDao;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class MailApi {

    private final MailDao mailDao;
    private final MutableLiveData<List<Mail>> mailListData;
    WebServiceApi webServiceApi;
    private final Context context;

    public MailApi(MailDao mailDao, MutableLiveData<List<Mail>> mailListData, @NonNull Context context) {
        this.mailDao = mailDao;
        this.mailListData = mailListData;
        this.context = context.getApplicationContext();

        Gson gson = new GsonBuilder()
                .excludeFieldsWithoutExposeAnnotation()
                .create();

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(context.getString(R.string.api))
                .addConverterFactory(GsonConverterFactory.create(gson))
                .build();
        webServiceApi = retrofit.create(WebServiceApi.class);
    }

    public String getToken() {
        SharedPreferences prefs = context.getSharedPreferences("user_prefs",
                Context.MODE_PRIVATE);
        return prefs.getString("auth_token", null);
    }

    public void reload(String label) {
        String token = getToken();
        Log.i("MailApi", "Token: " + token);

        Call<List<Mail>> call = webServiceApi.getMails("Bearer " + token, label);
        call.enqueue(
                new Callback<>() {

                    @Override
                    public void onResponse(@NonNull Call<List<Mail>> call,
                                           @NonNull Response<List<Mail>> response) {
                        new Thread(() -> {
                            if (response.isSuccessful() && response.body() != null) {
                                Log.i("MailApi", "Fetched mails successfully");
                                List<Mail> mails = response.body();
                                // Clear the existing mails in the database
                                mailDao.clear();
                                mailDao.insertList(mails);

                                List<Mail> dbMails = mailDao.getAllMails();
                                mailListData.postValue(dbMails);
                                // log the number of mails fetched
                                Log.i("MailApi", "Number of mails fetched: " + mails.size());
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
    public void sendMail(Mail mail) {
        String token = getToken();
        Log.i("MailApi", "Sending mail with token: " + token);

        Call<Void> call = webServiceApi.sendMail("Bearer " + token, mail);
        call.enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<Void> call,
                                   @NonNull Response<Void> response) {
                if (response.isSuccessful()) {
                    Log.i("MailApi", "Mail sent successfully");
                } else {
                    Log.e("MailApi", "Failed to send mail: " + response.message());
                }
            }

            @Override
            public void onFailure(@NonNull Call<Void> call, @NonNull Throwable t) {
                Log.e("MailApi", "Network error while sending mail: " + t.getMessage());
            }
        });
    }

    public void searchMail(String query) {
        String token = getToken();
        Log.i("MailApi", "Searching mail with token: " + token);

        Call<List<Mail>> call = webServiceApi.searchMails("Bearer " + token, query);
        call.enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<List<Mail>> call,
                                   @NonNull Response<List<Mail>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Log.i("MailApi", "Search completed successfully");
                    List<Mail> mails = response.body();
                    mailListData.postValue(mails);
                } else {
                    Log.e("MailApi", "Search failed: " + response.message());
                    mailListData.postValue(null);
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Mail>> call, @NonNull Throwable t) {
                Log.e("MailApi", "Network error during search: " + t.getMessage());
                mailListData.setValue(null);
            }
        });
    }

}
