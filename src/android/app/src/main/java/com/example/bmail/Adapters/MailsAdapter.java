package com.example.bmail.Adapters;

import android.util.Log;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.bmail.Entities.ServerMail;
import com.example.bmail.R;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Locale;

public class MailsAdapter extends RecyclerView.Adapter<MailsAdapter.mailViewHolder> {
    private final View.OnClickListener clickListener;
    private List<ServerMail> mailList;
    private final LayoutInflater inflater;

    public static class mailViewHolder extends RecyclerView.ViewHolder {
        private final TextView sender;
        private final TextView subject;
        private final TextView body;
        private final TextView timeTextView;
        private final ImageView avaterImageView;
        private ServerMail currentMail;

        public mailViewHolder(@NonNull View itemView, View.OnClickListener clickListener) {
            super(itemView);
            sender = itemView.findViewById(R.id.senderTextView);
            subject = itemView.findViewById(R.id.subjectTextView);
            body = itemView.findViewById(R.id.previewTextView);
            timeTextView = itemView.findViewById(R.id.timeTextView);
            avaterImageView = itemView.findViewById(R.id.avatarImageView);

            itemView.setOnClickListener(v -> {
                if (currentMail != null) {
                    Log.i("MailsAdapter", "Mail clicked: " + currentMail.getTitle());
                    v.setTag(currentMail);
                    clickListener.onClick(v);
                } else {
                    Log.w("MailsAdapter", "Current mail is null, cannot handle click.");
                }

            });
        }

        public void setMail(ServerMail mail) {
            this.currentMail = mail;
        }
    }

    public MailsAdapter(Context context, View.OnClickListener clickListener) {
        this.inflater = LayoutInflater.from(context);
        this.clickListener = clickListener;
    }

    @NonNull
    @Override
    public mailViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View itemView = inflater.inflate(R.layout.mail_item, parent, false);
        return new mailViewHolder(itemView, clickListener);
    }

    @Override
    public void onBindViewHolder(@NonNull mailViewHolder holder, int position) {
        ServerMail currentMail = mailList.get(position);
        Log.i("MailsAdapter", "Binding mail at position: " + position);
        Log.i("MailsAdapter", "Mail sender: " + currentMail.getFrom());
        Log.i("MailsAdapter", "Mail subject: " + currentMail.getTitle());

        holder.sender.setText(currentMail.getFrom());
        holder.subject.setText(currentMail.getTitle());
        holder.body.setText(currentMail.getBody());

        if (currentMail.getSenderImageBitmap() != null) {
            Log.i("MailsAdapter", "Setting sender image for: " + currentMail.getFrom());
            holder.avaterImageView.setImageBitmap(currentMail.getSenderImageBitmap());
        } else {
            holder.avaterImageView.setImageResource(R.drawable.ic_person);
        }

        if (currentMail.getUpdatedAt() != null) {
            DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault());
            holder.timeTextView.setText(dateFormat.format(currentMail.getUpdatedAt()));
        }
        holder.setMail(currentMail);
    }
    @Override
    public int getItemCount() {
        if (mailList == null) {
            return 0;
        }
        return mailList.size();
    }

    public void setMails(@NonNull List<ServerMail> mails) {
        notifyItemRangeRemoved(0, mailList == null ? 0 : mailList.size());
        this.mailList = mails;
        notifyItemRangeInserted(0, mailList.size());
    }

}