package com.example.bmail.Entities;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.PrimaryKey;
import com.google.gson.annotations.Expose;

import java.util.List;

@Entity
public class ServerMail {

    @PrimaryKey
    @Expose(serialize = false) // Exclude when sending, include when receiving
    @NonNull
    private String id = "";

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
    @Expose()
    private List<String> labels;

    public ServerMail(){}

    public ServerMail(String subject, String body, String sender, List<String> to, boolean draft) {
        this.title = subject;
        this.body = body;
        this.from = sender;
        this.to = to;
        this.draft = draft;
    }
    public ServerMail(String subject, String body, String sender, List<String> to, Boolean draft,
                      List<String> labels) {
        this.title = subject;
        this.body = body;
        this.from = sender;
        this.to = to;
        this.draft = draft;
        this.labels = labels;
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

    @NonNull
    @Override
    public String toString() {
        return "Mail{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", body='" + body + '\'' +
                ", from='" + from + '\'' +
                ", to=" + to +
                ", draft=" + draft +
                ", labels=" + labels +
                '}';
    }

    public List<String> getLabels() {
        return labels;
    }

    public void setLabels(List<String> labels) {
        this.labels = labels;
    }

    @NonNull
    public String getId() {
        return id;
    }
    public void setId(@NonNull String id) {
        this.id = id;
    }
}
