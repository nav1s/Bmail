package com.example.bmail.Entities;

import android.app.Application;

import com.example.bmail.Repositories.LabelRepository;
import com.example.bmail.Repositories.MailRepository;

public class BmailApplication extends Application {
    private static BmailApplication instance;
    private MailRepository mailRepository;
    private LabelRepository labelRepository;

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        mailRepository = new MailRepository(this);
        labelRepository = new LabelRepository(this);
    }

    public static BmailApplication getInstance() {
        return instance;
    }

    public MailRepository getMailRepository() {
        return mailRepository;
    }
    public LabelRepository getLabelRepository() {
        return labelRepository;
    }
}
