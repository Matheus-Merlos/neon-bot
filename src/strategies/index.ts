import Strategy from './base-strategy';
import DefaultStrategy from './generics/default';
import DeleteStrategy from './generics/delete';
import InfoStrategy from './generics/info';
import ListStrategy from './generics/list';

import CompleteObjectiveStrategy from './objectives/complete-objective';
import CreateObjectiveStrategy from './objectives/create-objective';
import ListCompletedObjectivesStrategy from './objectives/list-completed-objectives';
import SelectObjectiveStrategy from './objectives/select-objective';
import SelectedObjectivesStrategy from './objectives/selected-objectives';

import EditCharacterFieldStrategy from './character/edit-character-field';
import CompletedClassObjectiveStrategy from './class-objectives/completed';
import CreateClassObjectiveStrategy from './class-objectives/create';
import ListCompletedClassObjectivesStrategy from './class-objectives/list-completed';
import SetClassStrategy from './class-objectives/set-class';
import CreateStrategy from './generics/create';
import EditStrategy from './generics/edit';
import EditFieldStrategy from './generics/edit-field';
import EditImageStrategy from './generics/edit-img';
import BuyStrategy from './item/buy';
import CreateItemStrategy from './item/create-item';
import GiveItemStrategy from './item/give';
import UseStrategy from './item/use';
import CompletedMissionStrategy from './missions/completed-mission';
import CreateMissionStrategy from './missions/create-mission';
import RemoveSelectedObjectiveStrategy from './objectives/remove-selected';

export {
    BuyStrategy,
    CompletedClassObjectiveStrategy,
    CompletedMissionStrategy,
    CompleteObjectiveStrategy,
    CreateClassObjectiveStrategy,
    CreateItemStrategy,
    CreateMissionStrategy,
    CreateObjectiveStrategy,
    CreateStrategy,
    DefaultStrategy,
    DeleteStrategy,
    EditCharacterFieldStrategy,
    EditFieldStrategy,
    EditImageStrategy,
    EditStrategy,
    GiveItemStrategy,
    InfoStrategy,
    ListCompletedClassObjectivesStrategy,
    ListCompletedObjectivesStrategy,
    ListStrategy,
    RemoveSelectedObjectiveStrategy,
    SelectedObjectivesStrategy,
    SelectObjectiveStrategy,
    SetClassStrategy,
    Strategy,
    UseStrategy
};

