#pragma once
#include "../command/ICommand.h"
#include "../filter/IFilter.h"
#include <memory>

class AddFilterCommand : public ICommand {
private:
    std::shared_ptr<IFilter> filter;

public:
    AddFilterCommand(std::shared_ptr<IFilter> filter);
    void execute() override;
};
