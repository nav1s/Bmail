package com.example.bmail.Entities;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

import java.util.List;

@Entity
public class Mail {
    @PrimaryKey
    private final int id;
    private String title;
    private String body;
    private String from;
    private List<String> recipients;

    public Mail(int id, String subject, String body, String sender, List<String> recipients,
                Boolean draft) {
        this.id = id;
        this.title = subject;
        this.body = body;
        this.from = sender;
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

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getId() {
        return id;
    }
}
