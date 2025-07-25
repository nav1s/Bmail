package com.example.bmail;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class mailsAdapter extends RecyclerView.Adapter<mailsAdapter.mailViewHolder> {
    public static class mailViewHolder extends RecyclerView.ViewHolder {
        private final ImageView avatar;
        private final TextView sender;
        private final TextView subject;
        private final TextView preview;

        public mailViewHolder(@NonNull View itemView) {
            super(itemView);
            avatar = itemView.findViewById(R.id.avatarImageView);
            sender = itemView.findViewById(R.id.senderTextView);
            subject = itemView.findViewById(R.id.subjectTextView);
            preview = itemView.findViewById(R.id.previewTextView);
        }
    }

    private List<Mail> mailList;
    private final LayoutInflater inflater;

    public mailsAdapter(Context context) {
        this.inflater = LayoutInflater.from(context);
    }

    @NonNull
    @Override
    public mailViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View itemView = inflater.inflate(R.layout.mail_item, parent, false);
        return new mailViewHolder(itemView);
    }

    @Override
    public void onBindViewHolder(@NonNull mailViewHolder holder, int position) {
        Mail currentMail = mailList.get(position);
        holder.sender.setText(currentMail.getSender());
        holder.subject.setText(currentMail.getSubject());
        holder.preview.setText(currentMail.getSubject());
    }
    @Override
    public int getItemCount() {
        if (mailList == null) {
            return 0;
        }
        return mailList.size();
    }

    public List<Mail> getMails() {
        return mailList;
    }
    public void setMails(List<Mail> mails) {
        this.mailList = mails;
    }

}