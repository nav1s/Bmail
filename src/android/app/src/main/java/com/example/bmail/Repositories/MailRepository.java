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
            mails.add(new Mail("Welcome to BMail", "This is your first email!",
                    "System", List.of("Alice", "Bob"), false));
            mails.add(new Mail("Meeting Reminder",
                    "Don't forget our meeting tomorrow.",
                    "Alice", List.of("Bob"), false));
            mails.add(new Mail("Project Update",
                    "The project is on track for completion next week.",
                    "Bob", List.of("Alice"), false));
            mails.add(new Mail("Newsletter",
                    "Check out our latest updates and features.",
                    "Newsletter", List.of("Alice", "Bob"), false));
            setValue(mails);
        }
        @Override
        protected void onActive() {
            super.onActive();
            Log.d("MailListData", "MailListData is now active");
            new Thread(() ->
                    mailListData.postValue(mailDao.index())
            ).start();
        }
    }


    public MailRepository(@NonNull Context context) {
        AppDatabase db = Room.databaseBuilder(context.getApplicationContext(),
                        AppDatabase.class, "mail_database")
                .build();
        mailDao = db.mailDao();
        mailListData = new MailListData();
         mailApi = new MailApi(mailListData, context);
    }

    public LiveData<List<Mail>> getMails() {
        return mailListData;
    }


    public void sendMail(Mail mail) {
        mailApi.sendMail(mail);
    }

    public void deleteMail(Mail mail) {
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
