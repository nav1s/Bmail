package com.example.bmail.ViewModels;

import androidx.annotation.NonNull;
import androidx.lifecycle.ViewModel;
import androidx.lifecycle.ViewModelProvider;

import com.example.bmail.Repositories.MailRepository;

import java.util.Objects;

public class MailViewModelFactory implements ViewModelProvider.Factory {
    private final MailRepository mailRepository;

    public MailViewModelFactory(MailRepository mailRepository) {
        this.mailRepository = mailRepository;
    }

    @NonNull
    @Override
    public <T extends ViewModel> T create(@NonNull Class<T> modelClass) {
        if (modelClass.isAssignableFrom(MailViewModel.class)) {
            return Objects.requireNonNull(modelClass.cast(new MailViewModel(mailRepository)));
        }
        throw new IllegalArgumentException("Unknown ViewModel class");
    }
}