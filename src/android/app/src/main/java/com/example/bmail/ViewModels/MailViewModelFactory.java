package com.example.bmail.ViewModels;

import androidx.annotation.NonNull;
import androidx.lifecycle.ViewModel;
import androidx.lifecycle.ViewModelProvider;

import com.example.bmail.Repositories.LabelRepository;
import com.example.bmail.Repositories.MailRepository;

import java.util.Objects;

public class MailViewModelFactory implements ViewModelProvider.Factory {
    private final MailRepository mailRepository;
    private final LabelRepository labelRepository;

    public MailViewModelFactory(MailRepository mailRepository, LabelRepository labelRepository) {
        this.mailRepository = mailRepository;
        this.labelRepository = labelRepository;
    }

    @NonNull
    @Override
    public <T extends ViewModel> T create(@NonNull Class<T> modelClass) {
        if (modelClass.isAssignableFrom(MainActivityViewModel.class)) {
            return Objects.requireNonNull(modelClass.cast
                    (new MainActivityViewModel(mailRepository, labelRepository)));
        }
        throw new IllegalArgumentException("Unknown ViewModel class");
    }
}