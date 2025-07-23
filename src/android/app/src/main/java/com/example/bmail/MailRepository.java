package com.example.bmail;

import java.util.List;
import java.util.ArrayList;

public class MailRepository {

    // Dummy method to simulate loading emails
    public List<String> getEmails() {
        List<String> emails = new ArrayList<>();
        emails.add("Welcome to BMail!");
        emails.add("Your account has been created.");
        emails.add("Don't forget to check your inbox.");
        return emails;
    }
}

