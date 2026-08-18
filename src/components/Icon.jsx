export default function Icon({
    iconUrl = null,
    size = 48,
    color="currentColor",
    className = ""
}) {

    if (!iconUrl) return null;

    const style = {
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        backgroundColor: color,
        display: "inline-block",
        verticalAlign: "middle",

        WebkitMaskImage: `url('${iconUrl}')`,
        maskImage: `url('${iconUrl}')`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
    };

    return (
        <span
            className={`${className}-icon`.trim()}
            style={style}
            aria-hidden="true"
        />
    );
}
