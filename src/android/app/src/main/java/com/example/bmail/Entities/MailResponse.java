package com.example.bmail.Entities;

public class MailResponse {
    public String id;
    public String sender;
    public String recipients;
    public String subject;
    public String body;

    public MailResponse(String id, String sender, String recipients, String subject, String body) {
        this.id = id;
        this.sender = sender;
        this.recipients = recipients;
        this.subject = subject;
        this.body = body;
    }
}
