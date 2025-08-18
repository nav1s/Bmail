package com.example.bmail.Api;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.MutableLiveData;

import com.example.bmail.Entities.AttachLabelRequest;
import com.example.bmail.Entities.ClientMail;
import com.example.bmail.Entities.ServerMail;
import com.example.bmail.R;
import com.example.bmail.db.MailDao;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.ArrayList;
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
                .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") // ISO 8601 format
                .create();

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(context.getString(R.string.api))
                .addConverterFactory(GsonConverterFactory.create(gson))
                .build();
        webServiceApi = retrofit.create(WebServiceApi.class);
    }

    /**
     * @brief Retrieves the authentication token from SharedPreferences.
     * @return The authentication token, or null if not found.
     */
    public String getToken() {
        SharedPreferences prefs = context.getSharedPreferences("user_prefs",
                Context.MODE_PRIVATE);
        return prefs.getString("auth_token", null);
    }

    /**
     * @brief Loads all mails from the server and updates the local database.
     * This method fetches all mails from the server, clears the existing mails in the database,
     * and inserts the new mails. It also updates the live data to notify observers of the changes.
     */
    public void loadAllMails(){
        String token = getToken();
        Log.i("MailApi", "Token: " + token);
        // log the token being used
        Log.i("MailApi", "Loading all mails with token: " + token);

        Call<List<ServerMail>> call = webServiceApi.getAllMails("Bearer " + token);
        call.enqueue(
                new Callback<>() {

                    @Override
                    public void onResponse(@NonNull Call<List<ServerMail>> call,
                                           @NonNull Response<List<ServerMail>> response) {
                        new Thread(() -> {
                            if (response.body() == null) {
                                Log.e("MailApi", "Response body is null");
                                mailListData.postValue(null);
                                return;
                            }
                            Log.i("MailApi", "Fetched all mails successfully");
                            List<ServerMail> mails = response.body();
                            // Clear the existing mails in the database
                            mailDao.clear();
                            mailDao.insertList(mails);

                            List<ServerMail> dbMails = mailDao.getAllMails();
                            mailListData.postValue(dbMails);
                            // log the number of mails fetched
                            Log.i("MailApi", "Number of mails fetched: " + mails.size());
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
    /**
     * @brief Fetches mails for a specific label from the server and updates the local database.
     * @param label The label for which to fetch mails.
     */
    public void reload(@NonNull String label) {
        String token = getToken();
        Log.i("MailApi", "Token: " + token);
        // log the label being fetched
        Log.i("MailApi", "Fetching mails for label: " + label);

        Call<List<ServerMail>> call = webServiceApi.getMails("Bearer " + token,
                label.toLowerCase());
        call.enqueue(
                new Callback<>() {

                    @Override
                    public void onResponse(@NonNull Call<List<ServerMail>> call,
                                           @NonNull Response<List<ServerMail>> response) {
                        new Thread(() -> {
                            if (response.body() == null) {
                                Log.e("MailApi", "Response body is null");
                                mailListData.postValue(null);
                                return;
                            }
                            Log.i("MailApi", "Fetched mails successfully");
                            // log the response body size
                            // log the first mail if available
                            List<ServerMail> mails = response.body();
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

    /**
     * @brief Fetches all mails from the server and updates the local database.
     */
    public void sendMail(ClientMail mail, Callback<Void> callback) {
        String token = getToken();
        Log.i("MailApi", "Sending mail with token: " + token);
        String json = gson.toJson(mail);
        // log the mail object being sent
        Log.i("MailApi", "Mail object: " + json);

        Call<Void> call = webServiceApi.sendMail("Bearer " + token, mail);
        call.enqueue(callback);
    }

    /**
     * @brief Fetches all mails from the server and updates the local database.
     */
    public void updateDraft(ServerMail mail, String mailId, Callback<Void> callback) {
        String token = getToken();
        Log.i("MailApi", "Updating draft with token: " + token);
        Call<Void> call = webServiceApi.updateDraft("Bearer " + token, mail, mailId);
        call.enqueue(callback);
    }

    /**
     * @brief Searches for mails based on a query and updates the live data.
     * @param query The search query.
     */
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

    /**
     * @brief Adds a label to a mail and updates the local database.
     * @param mailId The ID of the mail to which the label will be added.
     * @param labelId The ID of the label to be added.
     */
    public void addLabelToMail(String mailId, String labelId) {
        AttachLabelRequest attachLabelRequest = new AttachLabelRequest(labelId);
        String json = gson.toJson(attachLabelRequest);
        // log the json object being sent
        Log.i("MailApi", "Adding label to mail with ID: " + mailId + " and label ID: " + labelId);
        Log.i("MailApi", "Label request JSON: " + json);

        String token = getToken();

        Call<Void> call = webServiceApi.addLabelToMail("Bearer " + token, mailId,
                attachLabelRequest);
        call.enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<Void> call,
                                   @NonNull Response<Void> response) {
                if (response.isSuccessful()) {
                    Log.i("MailApi", "Label added successfully");
                    new Thread(() -> {
                        ServerMail mail = mailDao.getById(mailId);
                        if (mail != null) {
                            List<String> updatedLabels = new ArrayList<>(mail.getLabels());
                            updatedLabels.add(labelId);
                            mailDao.updateMailLabels(mailId, updatedLabels);

                            List<ServerMail> updatedMails = mailDao.getAllMails();
                            mailListData.postValue(updatedMails);
                            Log.i("MailApi", "Label added to local database");
                        }
                    }).start();
                } else {
                    Log.e("MailApi", "Failed to add label: " + response.message());
                    // get the error message from the response body
                    try (okhttp3.ResponseBody errorBody = response.errorBody()) {
                        Log.e("MailApi", "Error body: " + errorBody);
                    } catch (Exception e) {
                        Log.e("MailApi", "Error reading error body: " + e.getMessage());
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<Void> call, @NonNull Throwable t) {
                Log.e("MailApi", "Network error while adding label: " + t.getMessage());
            }
        });
    }

    /**
     * @brief Removes a label from a mail and updates the local database.
     * @param mailId The ID of the mail from which the label will be removed.
     * @param labelId The ID of the label to be removed.
     */
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
                    // Remove the label from the local database
                    new Thread(() -> {
                        ServerMail mail = mailDao.getById(mailId);
                        if (mail != null) {
                            List<String> updatedLabels = new ArrayList<>(mail.getLabels());
                            updatedLabels.remove(labelId);
                            mailDao.updateMailLabels(mailId, updatedLabels);

                            List<ServerMail> updatedMails = mailDao.getAllMails();
                            mailListData.postValue(updatedMails);
                            Log.i("MailApi", "Label removed from local database");
                        }
                    }).start();
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

    /**
     * @brief Deletes a mail from the server and updates the local database.
     * @param mailId The ID of the mail to be deleted.
     */
    public void deleteMail(String mailId) {
        String token = getToken();
        Log.i("MailApi", "Deleting mail with ID: " + mailId);

        Call<Void> call = webServiceApi.deleteMail("Bearer " + token, mailId);
        call.enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<Void> call,
                                   @NonNull Response<Void> response) {
                if (response.isSuccessful()) {
                    Log.i("MailApi", "Mail deleted successfully");
                    // Remove the mail from the local database
                    new Thread(() -> {
                        mailDao.deleteById(mailId);
                        List<ServerMail> updatedMails = mailDao.getAllMails();
                        mailListData.postValue(updatedMails);
                        Log.i("MailApi", "Mail removed from local database");
                    });
                } else {
                    Log.e("MailApi", "Failed to delete mail: " + response.message());
                }
            }

            @Override
            public void onFailure(@NonNull Call<Void> call, @NonNull Throwable t) {
                Log.e("MailApi", "Network error while deleting mail: " + t.getMessage());
            }
        });

    }
}
