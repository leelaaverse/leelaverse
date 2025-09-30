import { useState, useEffect } from 'react'
import Icon from './Icon'

const PasswordStrengthIndicator = ({ password, showRules = true }) => {
    const [strength, setStrength] = useState(0)
    const [feedback, setFeedback] = useState([])

    const rules = [
        { test: /.{8,}/, message: 'At least 8 characters' },
        { test: /[a-z]/, message: 'One lowercase letter' },
        { test: /[A-Z]/, message: 'One uppercase letter' },
        { test: /\d/, message: 'One number' },
        { test: /[@$!%*?&]/, message: 'One special character (@$!%*?&)' }
    ]

    useEffect(() => {
        if (!password) {
            setStrength(0)
            setFeedback([])
            return
        }

        const results = rules.map(rule => ({
            ...rule,
            passed: rule.test.test(password)
        }))

        const passedCount = results.filter(r => r.passed).length
        setStrength(passedCount)
        setFeedback(results)
    }, [password])

    const getStrengthColor = () => {
        if (strength === 0) return 'bg-gray-200 dark:bg-gray-600'
        if (strength <= 2) return 'bg-red-400'
        if (strength <= 3) return 'bg-yellow-400'
        if (strength <= 4) return 'bg-blue-400'
        return 'bg-green-400'
    }

    const getStrengthText = () => {
        if (strength === 0) return ''
        if (strength <= 2) return 'Weak'
        if (strength <= 3) return 'Fair'
        if (strength <= 4) return 'Good'
        return 'Strong'
    }

    if (!password && !showRules) return null

    return (
        <div className="mt-2 space-y-2">
            {password && (
                <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                            style={{ width: `${(strength / 5) * 100}%` }}
                        ></div>
                    </div>
                    <span className={`text-xs font-medium ${strength <= 2 ? 'text-red-600 dark:text-red-400' :
                            strength <= 3 ? 'text-yellow-600 dark:text-yellow-400' :
                                strength <= 4 ? 'text-blue-600 dark:text-blue-400' :
                                    'text-green-600 dark:text-green-400'
                        }`}>
                        {getStrengthText()}
                    </span>
                </div>
            )}

            {showRules && feedback.length > 0 && (
                <div className="space-y-1">
                    {feedback.map((rule, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <Icon
                                name={rule.passed ? "check" : "x"}
                                className={`w-3 h-3 ${rule.passed
                                        ? 'text-green-500 dark:text-green-400'
                                        : 'text-gray-400 dark:text-gray-500'
                                    }`}
                            />
                            <span className={`text-xs ${rule.passed
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                {rule.message}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default PasswordStrengthIndicator