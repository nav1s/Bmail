package com.example.bmail.Repositories;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.room.Room;

import com.example.bmail.Adapters.MailsAdapter;
import com.example.bmail.Api.MailApi;
import com.example.bmail.Entities.ClientMail;
import com.example.bmail.Entities.ServerMail;
import com.example.bmail.db.AppDatabase;
import com.example.bmail.db.MailDao;

import java.util.LinkedList;
import java.util.List;

public class MailRepository {
    private final MailDao mailDao;
    private final MailListData mailListData;
    private final MailApi mailApi;

    class MailListData extends MutableLiveData<List<ServerMail>> {
        public MailListData() {
            super();
            List<ServerMail> mails = new LinkedList<>();
            setValue(mails);
        }
        @Override
        protected void onActive() {
            super.onActive();
            Log.d("MailListData", "MailListData is now active");
            new Thread(() ->
                    mailListData.postValue(mailDao.getAllMails())
            ).start();
        }
    }


    public MailRepository(@NonNull Context context) {
        AppDatabase db = Room.databaseBuilder(context.getApplicationContext(),
                        AppDatabase.class, "mail_database")
                .build();
        mailDao = db.mailDao();
        mailListData = new MailListData();
        mailApi = new MailApi(mailDao, mailListData, context);
    }

    /**
     * @brief Retrieves the list of mails.
     * @return A LiveData object containing the list of mails.
     */
    public LiveData<List<ServerMail>> getMails() {
        return mailListData;
    }

    /**
     * @brief Searches for mails based on a query.
     * @param query The search query to filter mails.
     */
    public void searchMail(String query) {
        Log.d("MailRepository", "Searching for mail with query: " + query);
        mailApi.searchMail(query);
    }

    /**
     * @brief Sends a mail.
     * @param mail The mail object to be sent.
     * @param callback The callback to handle the response of the mail sending operation.
     */
    public void sendMail(ClientMail mail, retrofit2.Callback<Void> callback) {
        mailApi.sendMail(mail, callback);
    }

    /**
     * @brief Updates a draft mail.
     * @param mail The new draft object
     * @param mailId the id of the draft
     */
    public void updateDraft(ServerMail mail, String mailId, retrofit2.Callback<Void> callback) {
        Log.d("MailRepository", "Updating draft for mail: " + mail);
        mailApi.updateDraft(mail, mailId, callback);
    }

    /**
     * @brief Retrieves a mail by its ID.
     * @param id The ID of the mail to be retrieved.
     * @return The mail object if found, otherwise null.
     */
    public ServerMail getMailById(String id) {
        List<ServerMail> mails = mailListData.getValue();
        if (mails != null) {
            for (ServerMail mail : mails) {
                // log the mail ID for debugging
               Log.d("MailRepository", "Checking mail ID: " + mail.getId());
               // log the mail object for debugging
                Log.d("MailRepository", "Mail object: " + mail);
                if (mail.getId().equals(id)) {
                    return mail;
                }
            }
        }
        return null;
    }

    /**
     * @brief Deletes a mail by its ID.
     * @param id The ID of the mail to be deleted.
     */
    public void deleteMail(String id) {
        Log.d("MailRepository", "Deleting mail with ID: " + id);
        mailApi.deleteMail(id);
    }

    /**
     * @brief Removes a label from a mail.
     * @param mailId The ID of the mail from which the label will be removed.
     * @param labelId The ID of the label to be removed.
     */
    public void removeLabelFromMail(String mailId, String labelId){
        Log.d("MailRepository", "Removing label " + labelId + " from mail " + mailId);
        mailApi.removeLabelFromMail(mailId, labelId);

    }

    /**
     * @brief Adds a label to a mail.
     * @param mailId The ID of the mail to which the label will be added.
     * @param labelId The ID of the label to be added.
     */
    public void addLabelToMail(String mailId, String labelId) {
        Log.d("MailRepository", "Adding label " + labelId + " to mail " + mailId);
        mailApi.addLabelToMail(mailId, labelId);
    }

    /**
     * @brief Reloads the mails for a specific label.
     * @param label The label for which to reload the mails.
     */
    public void reloadMails(String label) {
        mailApi.reload(label);
    }

    public void setMailsAdapter(MailsAdapter adapter) {
        mailApi.setMailsAdapter(adapter);
    }
}
