export default (arr : HTMLElement[], item:HTMLElement) => {
    const index = arr.indexOf(item)

    if (index !== -1) {
        arr.splice(index, 1)
    }
}
