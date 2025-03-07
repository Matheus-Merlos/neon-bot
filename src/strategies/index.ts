import Strategy from './base-strategy';
import DefaultStrategy from './generics/default';
import DeleteStrategy from './generics/delete';
import InfoStrategy from './generics/info';
import ListStrategy from './generics/list';

import CompleteObjectiveStrategy from './objectives/complete-objective';
import CreateObjectiveStrategy from './objectives/create-objective';
import CreateObjectiveDifficultyStrategy from './objectives/create-objective-difficulty';
import ListCompletedObjectivesStrategy from './objectives/list-completed-objectives';
import SelectObjectiveStrategy from './objectives/select-objective';
import SelectedObjectivesStrategy from './objectives/selected-objectives';

import CreateClassStrategy from './class-objectives/create-class';
import CompletedMissionStrategy from './missions/completed-mission';
import CreateMissionStrategy from './missions/create-mission';
import CreateMissionDifficultyStrategy from './missions/create-mission-difficulty';

export {
    CompletedMissionStrategy,
    CompleteObjectiveStrategy,
    CreateClassStrategy,
    CreateMissionDifficultyStrategy,
    CreateMissionStrategy,
    CreateObjectiveDifficultyStrategy,
    CreateObjectiveStrategy,
    DefaultStrategy,
    DeleteStrategy,
    InfoStrategy,
    ListCompletedObjectivesStrategy,
    ListStrategy,
    SelectedObjectivesStrategy,
    SelectObjectiveStrategy,
    Strategy
};

