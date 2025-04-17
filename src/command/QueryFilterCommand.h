#pragma once
#include "../command/ICommand.h"
#include "../filter/IFilter.h"
#include <memory>

class QueryFilterCommand : public ICommand {
private:
    std::shared_ptr<IFilter> filter;

public:
    QueryFilterCommand(std::shared_ptr<IFilter> filter);
    void execute() override;
};
