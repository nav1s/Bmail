package com.example.bmail.Repositories;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.room.Room;

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

    public LiveData<List<ServerMail>> getMails() {
        return mailListData;
    }

    public void searchMail(String query) {
        Log.d("MailRepository", "Searching for mail with query: " + query);
        mailApi.searchMail(query);
    }

    public void sendMail(ClientMail mail) {
        mailApi.sendMail(mail);
    }

    public void updateDraft(ServerMail mail, String mailId) {
        Log.d("MailRepository", "Updating draft for mail: " + mail);
        mailApi.updateDraft(mail, mailId);
    }

    public void deleteMail(ServerMail mail) {
        Log.d("MailRepository", "Deleting mail: " + mail);
//        mailApi.deleteMail(mail);

    }

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

    public void deleteMail(String id) {
        Log.d("MailRepository", "Deleting mail with ID: " + id);
        mailApi.deleteMail(id);
    }

    public void removeLabelFromMail(String mailId, String labelId){
        Log.d("MailRepository", "Removing label " + labelId + " from mail " + mailId);
        mailApi.removeLabelFromMail(mailId, labelId);

    }

    public void addLabelToMail(String mailId, String labelId) {
        Log.d("MailRepository", "Adding label " + labelId + " to mail " + mailId);
        mailApi.addLabelToMail(mailId, labelId);
    }

    public void reloadMails(String label) {
        mailApi.reload(label);
    }
}
