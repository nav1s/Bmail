package com.example.bmail.Entities;

import android.app.Application;

import com.example.bmail.Repositories.LabelRepository;
import com.example.bmail.Repositories.MailRepository;
import com.example.bmail.Repositories.UserRepository;

public class BmailApplication extends Application {
    private static BmailApplication instance;
    private MailRepository mailRepository;
    private LabelRepository labelRepository;
    private UserRepository userRepository;

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        mailRepository = new MailRepository(this);
        labelRepository = new LabelRepository(this);
        userRepository = new UserRepository(this);
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
    public UserRepository getUserRepository() {
        return userRepository;
    }
}
