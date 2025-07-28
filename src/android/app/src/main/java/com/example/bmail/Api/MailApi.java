package com.example.bmail.Api;

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

    private final MutableLiveData<List<Mail>> mailListData;
    WebServiceApi webServiceApi; Retrofit retrofit;
    public MailApi(MutableLiveData<List<Mail>> mailListData) {
        this.mailListData = mailListData;
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("http://localhost:8080/api/")
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        webServiceApi = retrofit.create(WebServiceApi.class);
    }

    public void get(){
        Call<List<Mail>> call = webServiceApi.getMails("Bearer ");
        call.enqueue(
                new Callback<List<Mail>>() {

                    @Override
                    public void onResponse(@NonNull Call<List<Mail>> call,
                                           @NonNull Response<List<Mail>> response) {
                        new Thread(() -> {
                            if (response.isSuccessful() && response.body() != null) {
                                List<Mail> mails = response.body();
                                mailListData.postValue(mails);
                            } else {
                                mailListData.postValue(null);
                            }
                        }).start();

                    }

                    @Override
                    public void onFailure(@NonNull Call<List<Mail>> call,
                                          @NonNull Throwable t) {
                    }
                }
        );

    }
}
