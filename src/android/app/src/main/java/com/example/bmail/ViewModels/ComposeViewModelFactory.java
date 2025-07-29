package com.example.bmail.ViewModels;

import androidx.annotation.NonNull;
import androidx.lifecycle.ViewModel;
import androidx.lifecycle.ViewModelProvider;

import com.example.bmail.Repositories.MailRepository;

public class ComposeViewModelFactory implements ViewModelProvider.Factory {
    private final MailRepository mailRepository;

    public ComposeViewModelFactory(MailRepository mailRepository) {
        this.mailRepository = mailRepository;
    }

    @SuppressWarnings("unchecked")
    @NonNull
    @Override
    public <T extends ViewModel> T create(@NonNull Class<T> modelClass) {
        if (modelClass.isAssignableFrom(ComposeViewModel.class)) {
            return (T) new ComposeViewModel(mailRepository);
        }
        throw new IllegalArgumentException("Unknown ViewModel class");
    }
}
