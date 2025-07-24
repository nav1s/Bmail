package com.example.bmail;

public class Email {
    public String id;
    public String sender;
    public String recipients;
    public String subject;
    public String body;

    public Email(String id, String sender, String recipients, String subject, String body) {
        this.id = id;
        this.sender = sender;
        this.recipients = recipients;
        this.subject = subject;
        this.body = body;
    }
}
