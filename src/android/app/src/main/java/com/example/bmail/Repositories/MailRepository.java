package com.example.bmail.Repositories;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.room.Room;

import com.example.bmail.Api.MailApi;
import com.example.bmail.Entities.Mail;
import com.example.bmail.db.AppDatabase;
import com.example.bmail.db.MailDao;

import java.util.LinkedList;
import java.util.List;

public class MailRepository {
    private final MailDao mailDao;
    private final MailListData mailListData;
    private final MailApi mailApi;

    class MailListData extends MutableLiveData<List<Mail>> {
        public MailListData() {
            super();
            List<Mail> mails = new LinkedList<>();
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

    public LiveData<List<Mail>> getMails() {
        return mailListData;
    }


    public void sendMail(Mail mail) {
        mailApi.sendMail(mail);
    }

    public void deleteMail(Mail mail) {
        Log.d("MailRepository", "Deleting mail: " + mail);

        mailDao.delete(mail);
    }

    public Mail getMailById(int id) {
        List<Mail> mails = mailListData.getValue();
        if (mails != null) {
            for (Mail mail : mails) {
                // log the mail ID for debugging
               Log.d("MailRepository", "Checking mail ID: " + mail.getId());
               // log the mail object for debugging
                Log.d("MailRepository", "Mail object: " + mail);
                if (mail.getId() == id) {
                    return mail;
                }
            }
        }
        return null;
    }

    public void reloadMails(String label) {
        mailApi.reload(label);
    }
}
