use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    QuestNotFound = 1,
    QuestNotActive = 2,
    QuestExpired = 3,
    QuestNotFinished = 4,
    QuestAlreadyResolved = 5,
    QuestNotResolved = 6,
    AlreadyRegistered = 7,
    UserNotRegistered = 8,
    InvalidMaxWinners = 9,
    InvalidRewardAmount = 10,
    InsufficientRewardPool = 11,
    InvalidDuration = 12,
    NoWinners = 13,
    Unauthorized = 14,
}
