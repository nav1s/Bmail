package com.example.bmail.Repositories;

import android.content.Context;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.bmail.Api.MailApi;
import com.example.bmail.Api.WebServiceApi;
import com.example.bmail.Entities.Mail;

import java.util.LinkedList;
import java.util.List;

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
    private final MailApi mailApi;


    public MailRepository(Context context) {
         mailApi = new MailApi(mailListData, context);
    }

    public LiveData<List<Mail>> getMails() {
        return mailListData;
    }


    public void sendMail(Mail mail) {
    }

    public void deleteMail(Mail mail) {
    }

    public void reloadMails() {
        mailApi.reload();
    }
}
