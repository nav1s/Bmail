package com.example.bmail;

import android.app.Application;
import com.example.bmail.Repositories.MailRepository;

public class BmailApplication extends Application {
    private static BmailApplication instance;
    private MailRepository mailRepository;

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        mailRepository = new MailRepository(this);
    }

    public static BmailApplication getInstance() {
        return instance;
    }

    public MailRepository getMailRepository() {
        return mailRepository;
    }
}
