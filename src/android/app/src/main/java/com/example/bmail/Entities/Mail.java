package com.example.bmail.Entities;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.PrimaryKey;
import com.google.gson.annotations.Expose;

import java.util.List;

@Entity
public class Mail {

    @PrimaryKey
    @Expose(serialize = false) // Exclude when sending, include when receiving
    private int id;

    @Expose
    private String title;
    @Expose
    private String body;
    @Expose
    private String from;
    @Expose
    private List<String> to;
    @Expose
    private Boolean draft;

    // Constructor for sending new mails (without ID as it breaks the server)
    public Mail(String subject, String body, String sender, List<String> to, Boolean draft) {
        this.title = subject;
        this.body = body;
        this.from = sender;
        this.to = to;
        this.draft = draft;
    }

    public Boolean getDraft() {
        return draft;
    }

    public void setDraft(Boolean draft) {
        this.draft = draft;
    }

    public List<String> getTo() {
        return to;
    }

    public void setTo(List<String> to) {
        this.to = to;
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

    public void setId(int id) {
        this.id = id;
    }

    @NonNull
    @Override
    public String toString() {
        return "Mail{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", body='" + body + '\'' +
                ", from='" + from + '\'' +
                ", to=" + to +
                ", draft=" + draft +
                '}';
    }
}
