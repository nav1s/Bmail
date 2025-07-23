package com.example.bmail;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class EmailAdapter extends RecyclerView.Adapter<EmailAdapter.EmailViewHolder> {
    private final List<String> emails;

    public EmailAdapter(List<String> emails) {
        this.emails = emails;
    }

    @NonNull
    @Override
    public EmailViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(android.R.layout.simple_list_item_1, parent, false);
        return new EmailViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull EmailViewHolder holder, int position) {
        holder.emailTextView.setText(emails.get(position));
    }

    @Override
    public int getItemCount() {
        return emails != null ? emails.size() : 0;
    }

    public static class EmailViewHolder extends RecyclerView.ViewHolder {
        TextView emailTextView;

        EmailViewHolder(@NonNull View itemView) {
            super(itemView);
            emailTextView = itemView.findViewById(android.R.id.text1);
        }
    }
}

