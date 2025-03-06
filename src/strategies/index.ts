import Strategy from './base-strategy';
import DefaultStrategy from './generics/default';
import InfoStrategy from './generics/info';
import ListStrategy from './generics/list';

import CompleteObjectiveStrategy from './objectives/complete-objective';
import CreateObjectiveStrategy from './objectives/create-objective';
import CreateObjectiveDifficultyStrategy from './objectives/create-objective-difficulty';
import ListCompletedObjectivesStrategy from './objectives/list-completed-objectives';
import SelectObjectiveStrategy from './objectives/select-objective';
import SelectedObjectivesStrategy from './objectives/selected-objectives';

export {
    CompleteObjectiveStrategy,
    CreateObjectiveDifficultyStrategy,
    CreateObjectiveStrategy,
    DefaultStrategy,
    InfoStrategy,
    ListCompletedObjectivesStrategy,
    ListStrategy,
    SelectedObjectivesStrategy,
    SelectObjectiveStrategy,
    Strategy
};

