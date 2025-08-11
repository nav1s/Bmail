package com.example.bmail.Api;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.MutableLiveData;

import com.example.bmail.Entities.ClientMail;
import com.example.bmail.Entities.LabelRequest;
import com.example.bmail.Entities.ServerMail;
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
    private final MutableLiveData<List<ServerMail>> mailListData;
    WebServiceApi webServiceApi;
    private final Context context;
    private final Gson gson;

    public MailApi(MailDao mailDao, MutableLiveData<List<ServerMail>> mailListData, @NonNull Context context) {
        this.mailDao = mailDao;
        this.mailListData = mailListData;
        this.context = context.getApplicationContext();

        gson = new GsonBuilder()
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
        // log the label being fetched
        Log.i("MailApi", "Fetching mails for label: " + label);

        Call<List<ServerMail>> call = webServiceApi.getMails("Bearer " + token, label);
        call.enqueue(
                new Callback<>() {

                    @Override
                    public void onResponse(@NonNull Call<List<ServerMail>> call,
                                           @NonNull Response<List<ServerMail>> response) {
                        new Thread(() -> {
                            if (response.isSuccessful() && response.body() != null) {
                                Log.i("MailApi", "Fetched mails successfully");
                                // log the response body size
                                // log the first mail if available
                                List<ServerMail> mails = response.body();
                                // log the mails fetched
                                Log.i("MailApi", "Mails fetched: " + mails.size());
                                // log the first mail's title if available
                                if (!mails.isEmpty()) {
                                    Log.i("MailApi", "First mail: " + mails.get(0));
                                }
                                // Clear the existing mails in the database
                                mailDao.clear();
                                mailDao.insertList(mails);

                                List<ServerMail> dbMails = mailDao.getAllMails();
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
                    public void onFailure(@NonNull Call<List<ServerMail>> call,
                                          @NonNull Throwable t) {
                        Log.e("MailApi", "Network error: " + t.getMessage());
                        mailListData.setValue(null);
                    }
                }
        );

    }
    public void sendMail(ClientMail mail) {
        String token = getToken();
        Log.i("MailApi", "Sending mail with token: " + token);
        String json = gson.toJson(mail);
        // log the mail object being sent
        Log.i("MailApi", "Mail object: " + json);

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

    public void updateDraft(ServerMail mail, String mailId) {
        String token = getToken();
        Log.i("MailApi", "Updating draft with token: " + token);
        Call <Void> call = webServiceApi.updateDraft("Bearer " + token, mail, mailId);
        call.enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<Void> call,
                                   @NonNull Response<Void> response) {
                if (response.isSuccessful()) {
                    Log.i("MailApi", "Draft updated successfully");
                } else {
                    Log.e("MailApi", "Failed to update draft: " + response.message());
                }
            }

            @Override
            public void onFailure(@NonNull Call<Void> call, @NonNull Throwable t) {
                Log.e("MailApi", "Network error while updating draft: " + t.getMessage());
            }
        });
    }

    public void searchMail(String query) {
        String token = getToken();
        Log.i("MailApi", "Searching mail with token: " + token);

        Call<List<ServerMail>> call = webServiceApi.searchMails("Bearer " + token, query);
        call.enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<List<ServerMail>> call,
                                   @NonNull Response<List<ServerMail>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Log.i("MailApi", "Search completed successfully");
                    List<ServerMail> mails = response.body();
                    mailListData.postValue(mails);
                } else {
                    Log.e("MailApi", "Search failed: " + response.message());
                    mailListData.postValue(null);
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<ServerMail>> call, @NonNull Throwable t) {
                Log.e("MailApi", "Network error during search: " + t.getMessage());
                mailListData.setValue(null);
            }
        });
    }

    public void addLabelToMail(String mailId, String labelId) {
        LabelRequest labelRequest = new LabelRequest(labelId);
        String json = gson.toJson(labelRequest);
        // log the json object being sent
        Log.i("MailApi", "Adding label to mail with ID: " + mailId + " and label ID: " + labelId);
        Log.i("MailApi", "Label request JSON: " + json);

        String token = getToken();

        Call<Void> call = webServiceApi.addLabelToMail("Bearer " + token, mailId, labelRequest);
        call.enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<Void> call,
                                   @NonNull Response<Void> response) {
                if (response.isSuccessful()) {
                    Log.i("MailApi", "Label added successfully");
                } else {
                    Log.e("MailApi", "Failed to add label: " + response.message());
                }
            }

            @Override
            public void onFailure(@NonNull Call<Void> call, @NonNull Throwable t) {
                Log.e("MailApi", "Network error while adding label: " + t.getMessage());
            }
        });
    }

    public void removeLabelFromMail(String mailId, String labelId) {
        String token = getToken();
        Log.i("MailApi", "Removing label from mail with ID: "
                + mailId + " and label ID: " + labelId);

        Call<Void> call = webServiceApi.removeLabelFromMail("Bearer " + token, mailId, labelId);
        call.enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<Void> call,
                                   @NonNull Response<Void> response) {
                if (response.isSuccessful()) {
                    Log.i("MailApi", "Label removed successfully");
                } else {
                    Log.e("MailApi", "Failed to remove label: " + response.message());
                }
            }

            @Override
            public void onFailure(@NonNull Call<Void> call, @NonNull Throwable t) {
                Log.e("MailApi", "Network error while removing label: " + t.getMessage());
            }
        });

    }
}
