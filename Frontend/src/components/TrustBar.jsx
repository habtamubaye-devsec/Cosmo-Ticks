import { Leaf, Heart, FlaskConical, Package } from "lucide-react";

function TrustBar() {
    const trustItems = [
        { icon: <Leaf className="w-6 h-6" />, label: "Clean Ingredients", color: "text-green-700" },
        { icon: <Heart className="w-6 h-6" />, label: "Cruelty Free", color: "text-pink-600" },
        { icon: <FlaskConical className="w-6 h-6" />, label: "Dermatologist Tested", color: "text-teal-600" },
        { icon: <Package className="w-6 h-6" />, label: "Sustainable Packaging", color: "text-emerald-600" },
    ];

    return (
        <div className="bg-white py-12 border-b border-gray-100">
            <div className="container mx-auto px-6">
                <div className="flex flex-wrap justify-center gap-12 md:gap-20">
                    {trustItems.map((item, index) => (
                        <div key={index} className="flex flex-col items-center gap-3 text-center">
                            <div className={`${item.color}`}>
                                {item.icon}
                            </div>
                            <span className="text-sm text-gray-700">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TrustBar;
