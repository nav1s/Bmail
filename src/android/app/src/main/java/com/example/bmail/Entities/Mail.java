package com.example.bmail.Entities;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

import java.util.List;

@Entity
public class Mail {
    @PrimaryKey
    private final int id;
    private String subject;
    private String body;
    private String sender;
    private List<String> recipients;

    public Mail(int id, String subject, String body, String sender, List<String> recipients,
                Boolean draft) {
        this.id = id;
        this.subject = subject;
        this.body = body;
        this.sender = sender;
        this.recipients = recipients;
        this.draft = draft;
    }

    private Boolean draft;


    public Boolean getDraft() {
        return draft;
    }

    public void setDraft(Boolean draft) {
        this.draft = draft;
    }

    public List<String> getRecipients() {
        return recipients;
    }

    public void setRecipients(List<String> recipients) {
        this.recipients = recipients;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public int getId() {
        return id;
    }
}
