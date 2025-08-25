const getNOfDaysToTheNextWeekday = (weekday = 1) => {
    const today = new Date();
    const nextWeekday = new Date(today);
    nextWeekday.setDate(today.getDate() + (weekday - today.getDay() + 7) % 7);
    return nextWeekday;
}

console.log(getNOfDaysToTheNextWeekday(2));