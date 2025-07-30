package com.example.bmail.Repositories;

import android.content.Context;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.bmail.Api.MailApi;
import com.example.bmail.Entities.Mail;

import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

public class MailRepository {
    static class MailListData extends MutableLiveData<List<Mail>> {
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
        mailApi.sendMail(mail);
    }

    public void deleteMail(Mail mail) {
    }

    public Mail getMailById(int id) {
        List<Mail> mails = mailListData.getValue();
        if (mails != null) {
            for (Mail mail : mails) {
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
