updatePosition = function () {
    const pos_slider = slider.get_position()
    pos[0] = pos_slider[0]
    pos[1] = pos_slider[1]
    updateCart()
    updatePol()
    render()
}
updatePosition()